using Microsoft.AspNetCore.Mvc;

namespace FincaAppApi.Controllers
{
    public class FincasController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
