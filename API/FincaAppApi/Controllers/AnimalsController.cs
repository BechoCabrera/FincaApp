using Microsoft.AspNetCore.Mvc;

namespace FincaAppApi.Controllers
{
    public class AnimalsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
