using FincaAppApi.Application.Features.Requests.ToroRequest;
using FincaAppApplication.Features.Requests.ToroRequest;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FincaAppApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TorosController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TorosController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // POST: api/toros
        [HttpPost]
        public async Task<IActionResult> CreateToro([FromBody] CreateToroRequest request, CancellationToken cancellationToken)
        {
            if (request == null)
                return BadRequest("Los datos del toro son requeridos.");

            var toroDto = await _mediator.Send(request, cancellationToken);
            return CreatedAtAction(nameof(GetToro), new { id = toroDto.Id }, toroDto);
        }

        // GET: api/toros/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetToro(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var toroDto = await _mediator.Send(new GetToroByIdRequest { Id = id }, cancellationToken);
                return Ok(toroDto);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        // PUT: api/toros/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateToro(
        Guid id,
        [FromBody] UpdateToroRequest request,
        CancellationToken ct)
        {
            request.Id = id;
            var result = await _mediator.Send(request, ct);
            return Ok(result);
        }

        // DELETE: api/toros/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteToro(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                await _mediator.Send(new DeleteToroRequest { Id = id }, cancellationToken);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        // GET: api/toros
        [HttpGet]
        public async Task<IActionResult> SearchToro(
            [FromQuery] string? nombre,
            [FromQuery] string? numero,
            CancellationToken cancellationToken)
        {
            var request = new SearchToroRequest
            {
                Nombre = nombre,
                Numero = numero
            };

            var toros = await _mediator.Send(request, cancellationToken);
            return Ok(toros);
        }

    }
}
