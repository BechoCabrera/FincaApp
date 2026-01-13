using MediatR;
using Microsoft.AspNetCore.Mvc;
using FincaAppApplication.DTOs.Escotera;
using FincaAppApplication.Features.Requests.Escotera;

namespace FincaAppApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EscoterasController : ControllerBase
    {
        private readonly IMediator _mediator;

        public EscoterasController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // ================= CREATE =================
        // POST: api/escoteras
        [HttpPost]
        public async Task<ActionResult<Guid>> Create([FromBody] CreateEscoteraRequest request, CancellationToken ct)
        {
            if (request == null)
                return BadRequest("Datos requeridos.");

            try
            {
                var id = await _mediator.Send(request, ct);
                return Ok(new { id });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // ================= LIST =================
        // GET: api/escoteras
        [HttpGet]
        public async Task<ActionResult<List<EscoteraDto>>> GetAll(
            CancellationToken ct)
        {
            var result = await _mediator.Send(
                new ListEscoterasRequest(),
                ct);

            return Ok(result);
        }

        // ================= GET BY ID =================
        // GET: api/escoteras/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<EscoteraDto>> GetById(
            Guid id,
            CancellationToken ct)
        {
            var items = await _mediator.Send(
                new ListEscoterasRequest(),
                ct);

            var item = items.FirstOrDefault(x => x.Id == id);

            if (item == null)
                return NotFound();

            return Ok(item);
        }

        // ================= UPDATE =================
        // PUT: api/escoteras/{id}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(
            Guid id,
            [FromBody] UpdateEscoteraRequest request,
            CancellationToken ct)
        {
            if (request == null || id != request.Id)
                return BadRequest("Datos inválidos.");

            try
            {
                await _mediator.Send(request, ct);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // ================= DELETE =================
        // DELETE: api/escoteras/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(
            Guid id,
            CancellationToken ct)
        {
            try
            {
                await _mediator.Send(
                    new DeleteEscoteraRequest { Id = id },
                    ct);

                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
