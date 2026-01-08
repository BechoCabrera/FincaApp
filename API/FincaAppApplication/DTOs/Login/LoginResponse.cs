namespace FincaAppApplication.DTOs.Login;

public class LoginResponse
{
    public Guid UserId { get; set; }
    public string TenantId { get; set; }
    public string Token { get; set; } = null!;
}
