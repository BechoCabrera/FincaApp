using MediatR;
using Microsoft.AspNetCore.Mvc;
using FincaAppApplication.Features.Requests.CriaMachoRequest;

namespace FincaAppApi.Controllers
{
    [ApiController]
    [Route("api/crias-machos")]
    public class CriasMachosController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CriasMachosController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // POST: api/criasmachos
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCriaMachoRequest request, CancellationToken ct)
        {
            if (request == null)
                return BadRequest("Los datos de la cría macho son requeridos.");

            var id = await _mediator.Send(request, ct);
            return CreatedAtAction(nameof(GetById), new { id }, new { id });
        }

        // GET: api/criasmachos
        [HttpGet]
        public async Task<IActionResult> Search(
            [FromQuery] string? nombre,
            [FromQuery] Guid? fincaId,
            CancellationToken ct)
        {
            var request = new SearchCriasMachosRequest
            {
                Nombre = nombre,
                FincaId = fincaId
            };

            var items = await _mediator.Send(request, ct);
            return Ok(items);
        }

        // GET: api/criasmachos/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        {
            try
            {
                var dto = await _mediator.Send(new GetCriaMachoByIdRequest { Id = id }, ct);
                return Ok(dto);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        // PUT: api/criasmachos/{id}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCriaMachoRequest request, CancellationToken ct)
        {
            if (request == null || id != request.Id)
                return BadRequest("Datos inválidos.");

            try
            {
                var result = await _mediator.Send(request, ct);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        // DELETE: api/criasmachos/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        {
            try
            {
                await _mediator.Send(new DeleteCriaMachoRequest { Id = id }, ct);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}