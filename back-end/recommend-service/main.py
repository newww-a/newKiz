from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
import pickle
import numpy as np
from lightfm import LightFM
from lightfm.data import Dataset
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
import os

# ✅ .env 파일 로드
load_dotenv()

# ✅ 환경변수에서 MongoDB 접속 정보 가져오기
MONGO_HOST = os.getenv("MONGO_HOST")
MONGO_DB = os.getenv("MONGO_DATABASE")
MONGO_USER = os.getenv("MONGO_USER")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
ARTICLE_COLLECTION = os.getenv("ARTICLE_DATABASE")

# ✅ MongoDB URI 생성
MONGO_URI = f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}/?authSource=admin"

# ✅ MongoDB 연결
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db[ARTICLE_COLLECTION]

app = FastAPI()

# 뉴스 데이터 로드 및 전처리
def load_articles():
    documents = list(collection.find({}, {"_id": 1, "word_list.word": 1}))
    data = []
    for doc in documents:
        if "word_list" in doc and isinstance(doc["word_list"], list):
            words = [entry["word"] for entry in doc["word_list"] if "word" in entry]
            data.append({
                "_id": str(doc["_id"]),
                "keywords": " ".join(words)
            })
    return pd.DataFrame(data)

articles_df = load_articles()

# TF-IDF 벡터화 및 유사도 계산
vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(articles_df["keywords"])
cosine_sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)

try:
    with open("./lightfm/lightfm_model.pkl", "rb") as f:
        model_bundle = pickle.load(f)
    model = model_bundle["model"]
    dataset = model_bundle["dataset"]
    user_features = model_bundle["user_features"]
    item_features = model_bundle["item_features"]
    interactions = model_bundle["interactions"]
    weights = model_bundle["weights"]
    item_id_to_category = model_bundle["item_id_to_category"]

    # 사용자 및 아이템 매핑
    user_id_map, _, item_id_map, _ = dataset.mapping()

    print("✅ 모델 및 데이터셋 로드 성공!")
except Exception as e:
    print("❌ 모델 로드 실패:", e)
    model = None
    dataset = None
    user_id_map = {}
    item_id_map = {}

# 역매핑도 생성 (인덱스 → 아이템 ID)
reverse_item_map = {v: k for k, v in item_id_map.items()}

class RecommendRequest(BaseModel):
    user_id: str

class RecommendCategoryRequest(BaseModel):
    user_id: str
    category_id: str

class RelatedNewsRequest(BaseModel):
    content_id: str

@app.post("/api/recommend")
def recommend(req: RecommendRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="모델이 로드되지 않았습니다.")

    try:
        if req.user_id in user_id_map:
            user_index = user_id_map[req.user_id]
        else:
            print(f"[⚠️ Cold Start] Unknown user_id: {req.user_id}, using dummy user '9999'")
            user_index = user_id_map["9999"]

        item_indices = np.arange(len(item_id_map))

        scores = model.predict(user_ids=user_index, item_ids=item_indices,
                               user_features=user_features, item_features=item_features)

        top_indices = np.argsort(-scores)[:10]
        recommended_items = [reverse_item_map[i] for i in top_indices]

        return {
            "user_id": req.user_id,
            "recommended": recommended_items
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommend/category")
def recommend_by_category(req: RecommendCategoryRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="모델이 로드되지 않았습니다.")

    try:
        if req.user_id in user_id_map:
            user_index = user_id_map[req.user_id]
        else:
            print(f"[⚠️ Cold Start] Unknown user_id: {req.user_id}, using dummy user '9999'")
            user_index = user_id_map["9999"]

        # 1. 해당 카테고리에 속한 아이템 ID만 필터링
        filtered_item_ids = [
            item_id for item_id, category in item_id_to_category.items()
            if category == req.category_id
        ]

        if not filtered_item_ids:
            raise HTTPException(status_code=404, detail="해당 카테고리에 아이템이 없습니다.")

        # 2. 필터링된 아이템 ID → 인덱스로 변환
        filtered_item_indices = [item_id_map[item_id] for item_id in filtered_item_ids]

        # 3. 점수 예측
        scores = model.predict(user_ids=user_index, item_ids=np.array(filtered_item_indices),
                               user_features=user_features, item_features=item_features)

        # 4. 상위 5개 추출
        top_indices = np.argsort(-scores)[:10]
        recommended_item_indices = [filtered_item_indices[i] for i in top_indices]
        recommended_items = [reverse_item_map[i] for i in recommended_item_indices]

        return {
            "user_id": req.user_id,
            "recommended": recommended_items
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/related")
def recommend_related_news(req: RelatedNewsRequest):
    try:
        if req.content_id not in articles_df["_id"].values:
            raise HTTPException(status_code=404, detail="입력한 content_id가 존재하지 않습니다.")

        idx = articles_df[articles_df["_id"] == req.content_id].index[0]
        sim_scores = list(enumerate(cosine_sim_matrix[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        top_similar_indices = [i for i, score in sim_scores[1:11]]  # 자기 자신 제외

        recommended_ids = articles_df.iloc[top_similar_indices]["_id"].tolist()

        return {
            "input_id": req.content_id,
            "related_news": recommended_ids
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"관련 뉴스 추천 실패: {str(e)}")