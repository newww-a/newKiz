package site.newkiz.mypageserver.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.newkiz.mypageserver.entity.NewsDocument;
import site.newkiz.mypageserver.entity.School;
import site.newkiz.mypageserver.entity.dto.CategoryScoreDto;
import site.newkiz.mypageserver.entity.dto.MypageRequest;
import site.newkiz.mypageserver.entity.dto.MypageResponse;
import site.newkiz.mypageserver.entity.dto.MypageUpdateRequest;
import site.newkiz.mypageserver.global.ApiResponse;
import site.newkiz.mypageserver.service.MypageService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage")
public class MypageController {

  private final MypageService mypageService;

  @GetMapping
  public ApiResponse<MypageResponse> getMypage(@RequestHeader("User-Id") Integer userId) {
    return ApiResponse.success(mypageService.getMypage(userId));
  }

  @PostMapping
  public ApiResponse<MypageResponse> registMypage(@RequestHeader("User-Id") Integer userId,
      @RequestBody MypageRequest mypageRequest) {
    return ApiResponse.success(mypageService.registMypage(userId, mypageRequest));
  }

  @PatchMapping
  public ApiResponse<MypageResponse> updateMypage(@RequestHeader("User-Id") Integer userId,
      @RequestBody MypageUpdateRequest mypageUpdateRequest) {
    return ApiResponse.success(mypageService.updateMypage(userId, mypageUpdateRequest));
  }

  @GetMapping("/school")
  public ApiResponse<List<School>> getSchools() {
    return ApiResponse.success(mypageService.getSchools());
  }

  @GetMapping("/scrap/news")
  public ApiResponse<List<NewsDocument>> getScrapNews(@RequestHeader("User-Id") Integer userId) {
    return ApiResponse.success(mypageService.getScrapNews(userId));
  }

  @GetMapping("/graph")
  public ApiResponse<CategoryScoreDto> getGraph(@RequestHeader("User-Id") Integer userId) {
    return ApiResponse.success(mypageService.getGraph(userId));
  }

}
