export const grassMapData: number[] = [
  0, 1, 1, 1, 1, 1, 1, 2, 11, 12, 12, 67, 12, 12, 12, 13, 11, 12, 12, 12, 12, 12, 12, 13, 11, 12, 12, 12, 12, 12, 12, 13, 11, 12, 12, 12, 12, 12, 68, 13, 11, 12, 12, 12, 12, 12, 12, 13, 11, 68, 12,
  12, 12, 12, 12, 13, 22, 23, 23, 23, 23, 23, 23, 24,
]

export const waterMapData: number[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, -1,
  -1, -1, -1, -1, -1, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]

export const biomeData: number[] = [
  -1, -1, -1, -1, -1, 41, -1, -1, -1, -1, 43, -1, -1, -1, 41, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 42, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, 14, -1, -1, -1, -1, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 44, -1, -1, -1, -1, -1, -1, -1, 33, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, 15, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 42, -1, -1, -1, -1, -1, 41, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, 44, -1, -1, -1, -1, -1, -1, -1, -1,
]

export const newMapData: number[] = (() => {
  const width = 80
  const height = 80

  const result: number[] = []
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const centerEven = 39 // 짝수 행의 중앙 열
      const centerOdd = 40 // 홀수 행의 중앙 열
      const halfWidth = Math.floor(width / 2)

      if (row === 0 || row === height - 1 || row === 1 || row === height - 2) {
        // 첫 두 행과 마지막 두 행은 모두 -1
        result.push(-1)
      } else if ((row % 2 === 0 && col === centerEven) || (row % 2 !== 0 && col === centerOdd)) {
        // 짝수 행의 19번째 열 또는 홀수 행의 20번째 열은 12
        result.push(12)
      } else if (col < halfWidth) {
        // 왼쪽 절반에 O 모양 만들기 (더 부드럽게)
        const centerRow = Math.floor(height / 2)
        const centerCol = Math.floor(halfWidth / 2)
        const radiusX = Math.floor(halfWidth / 3)
        const radiusY = Math.floor(height / 6)

        // 타원 방정식을 사용하여 더 부드러운 O 모양 생성
        const normalizedDistance = Math.pow((row - centerRow) / radiusY, 2) + Math.pow((col - centerCol) / radiusX, 2)

        // 타원의 테두리 범위를 넓혀 더 두껍게 만듦
        if (normalizedDistance >= 0.7 && normalizedDistance <= 1.3) {
          result.push(12)
        } else {
          result.push(-1)
        }
      } else if (col > halfWidth) {
        // 오른쪽 절반에 X 모양 만들기
        const rightCenter = halfWidth + Math.floor(halfWidth / 2)
        const centerRow = Math.floor(height / 2)
        const xLength = Math.floor(height / 8) // X의 길이

        // X의 중심에서의 거리
        const distFromCenterRow = Math.abs(row - centerRow)
        const distFromCenterCol = Math.abs(col - rightCenter)

        // X 모양의 대각선 두께를 증가시킴 (1에서 2로 변경)
        if (
          distFromCenterRow <= xLength &&
          distFromCenterCol <= xLength &&
          (Math.abs(distFromCenterRow - distFromCenterCol) <= 2 || // 첫 번째 대각선 두께 증가
            Math.abs(distFromCenterRow + distFromCenterCol - 2 * xLength) <= 2) // 두 번째 대각선 두께 증가
        ) {
          result.push(12)
        } else {
          result.push(-1)
        }
      } else {
        result.push(-1)
      }
    }
  }

  return result
})()
