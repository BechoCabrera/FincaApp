using MediatR;
using Microsoft.AspNetCore.Mvc;
using FincaAppApplication.Features.Requests.FincaRequest;
using FincaAppApplication.DTOs.Finca;

namespace FincaAppApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FincasController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FincasController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // POST: api/fincas
        [HttpPost]
        public async Task<ActionResult<FincaDto>> CreateFinca(
            [FromBody] CreateFincaRequest request,
            CancellationToken cancellationToken)
        {
            if (request == null)
                return BadRequest("Los datos de la finca son requeridos.");

            var fincaDto = await _mediator.Send(request, cancellationToken);

            return CreatedAtAction(
                nameof(GetFincaById),
                new { id = fincaDto.Id },
                fincaDto);
        }

        // GET: api/fincas
        [HttpGet]
        public async Task<ActionResult<List<FincaDto>>> GetFincas(
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new ListFincasRequest(),
                cancellationToken);

            return Ok(result);
        }

        // GET: api/fincas/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<FincaDto>> GetFincaById(
            Guid id,
            CancellationToken cancellationToken)
        {
            // reutilizamos listado y filtramos (simple y seguro)
            var fincas = await _mediator.Send(
                new ListFincasRequest(),
                cancellationToken);

            var finca = fincas.FirstOrDefault(x => x.Id == id);
            if (finca == null)
                return NotFound();

            return Ok(finca);
        }

        // PUT: api/fincas/{id}
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<FincaDto>> UpdateFinca(
            Guid id,
            [FromBody] UpdateFincaRequest request,
            CancellationToken cancellationToken)
        {
            if (request == null || id != request.Id)
                return BadRequest("Datos inválidos.");

            try
            {
                var fincaDto = await _mediator.Send(request, cancellationToken);
                return Ok(fincaDto);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        // DELETE: api/fincas/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteFinca(
            Guid id,
            CancellationToken cancellationToken)
        {
            try
            {
                await _mediator.Send(
                    new DeleteFincaRequest { Id = id },
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
