using MediatR;
using Microsoft.AspNetCore.Mvc;
using FincaAppApplication.Features.Requests.ParidaRequest;
using FincaAppApplication.DTOs.Parida;

namespace FincaAppApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParidasController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ParidasController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<ActionResult<object>> CreateParida(
            [FromBody] CreateParidaRequest request,
            CancellationToken cancellationToken)
        {
            if (request == null)
                return BadRequest("Los datos de la parida son requeridos.");

            var id = await _mediator.Send(request, cancellationToken);

            return CreatedAtAction(
                nameof(GetParidaById),
                new { id },
                new { id });
        }

        [HttpGet]
        public async Task<ActionResult<List<ParidaDto>>> GetParidas(
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new ListParidasRequest(),
                cancellationToken);

            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ParidaDto>> GetParidaById(
            Guid id,
            CancellationToken cancellationToken)
        {
            var paridas = await _mediator.Send(
                new ListParidasRequest(),
                cancellationToken);

            var parida = paridas.FirstOrDefault(x => x.Id == id);
            if (parida == null)
                return NotFound();

            return Ok(parida);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateParida(
            Guid id,
            [FromBody] UpdateParidaRequest request,
            CancellationToken cancellationToken)
        {
            if (request == null)
                return BadRequest("Datos inválidos.");

            request.Id = id;

            try
            {
                await _mediator.Send(request, cancellationToken);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteParida(
            Guid id,
            CancellationToken cancellationToken)
        {
            try
            {
                await _mediator.Send(
                    new DeleteParidaRequest { Id = id },
                    cancellationToken);

                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
