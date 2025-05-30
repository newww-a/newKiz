package site.newkiz.mypageserver.global;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@ToString(of = {"success", "data", "error"})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class ApiResponse<T> {

  private boolean success;
  private T data;
  private ApiError error;


  private ApiResponse(boolean success, T data, ApiError error) {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  public static <T> ApiResponse<T> success() {
    return success(null);
  }

  public static <T> ApiResponse<T> success(T response) {
    return new ApiResponse<>(true, response, null);
  }

  public static ApiResponse<?> error(String code, String message) {
    return new ApiResponse<>(false, null, new ApiError(code, message));
  }

  @ToString(of = {"code", "message"})
  @NoArgsConstructor(access = AccessLevel.PROTECTED)
  @Getter
  protected static class ApiError {

    private String code;
    private String message;

    public ApiError(String code, String message) {
      this.code = code;
      this.message = message;
    }
  }

}