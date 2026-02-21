using MediatR;
using Microsoft.AspNetCore.Mvc;
using FincaAppApplication.Features.Requests.FallecidaRequest;
using FincaAppApplication.DTOs.Fallecida;

namespace FincaAppApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FallecidasController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FallecidasController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // POST: api/fallecidas
        [HttpPost]
        public async Task<ActionResult<FallecidaDto>> CreateFallecida(
            [FromBody] CreateFallecidaRequest request,
            CancellationToken cancellationToken)
        {
            if (request == null)
                return BadRequest("Los datos de la fallecida son requeridos.");

            FallecidaDto fallecidaDto = await _mediator.Send(request, cancellationToken);

            return CreatedAtAction(
                nameof(GetFallecidaById),
                new { id = fallecidaDto.Id },
                fallecidaDto);
        }

        // GET: api/fallecidas
        [HttpGet]
        public async Task<ActionResult<List<FallecidaDto>>> GetFallecidas(
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new ListFallecidasRequest(),
                cancellationToken);

            return Ok(result);
        }

        // GET: api/fallecidas/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<FallecidaDto>> GetFallecidaById(
            Guid id,
            CancellationToken cancellationToken)
        {
            var fallecidas = await _mediator.Send(
                new ListFallecidasRequest(),
                cancellationToken);

            var fallecida = fallecidas.FirstOrDefault(x => x.Id == id);
            if (fallecida == null)
                return NotFound();

            return Ok(fallecida);
        }

        // PUT: api/fallecidas/{id}
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<FallecidaDto>> UpdateFallecida(
            Guid id,
            [FromBody] UpdateFallecidaRequest request,
            CancellationToken cancellationToken)
        {
            if (request == null || id != request.Id)
                return BadRequest("Datos inválidos.");

            try
            {
                var fallecidaDto = await _mediator.Send(request, cancellationToken);
                return Ok(fallecidaDto);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        // DELETE: api/fallecidas/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteFallecida(
            Guid id,
            CancellationToken cancellationToken)
        {
            try
            {
                await _mediator.Send(
                    new DeleteFallecidaRequest { Id = id },
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