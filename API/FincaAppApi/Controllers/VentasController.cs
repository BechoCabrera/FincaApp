using MediatR;
using Microsoft.AspNetCore.Mvc;
using FincaAppApplication.Features.Requests.VentaRequest;
using FincaAppApplication.DTOs.Venta;

namespace FincaAppApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VentasController : ControllerBase
    {
        private readonly IMediator _mediator;

        public VentasController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // POST: api/ventas
        [HttpPost]
        public async Task<ActionResult<VentaDto>> CreateVenta(
            [FromBody] CreateVentaRequest request,
            CancellationToken cancellationToken)
        {
            if (request == null)
                return BadRequest("Los datos de la venta son requeridos.");

            VentaDto ventaDto = await _mediator.Send(request, cancellationToken);

            return CreatedAtAction(
                nameof(GetVentaById),
                new { id = ventaDto.Id },
                ventaDto);
        }

        // GET: api/ventas
        [HttpGet]
        public async Task<ActionResult<List<VentaDto>>> GetVentas(
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new ListVentasRequest(),
                cancellationToken);

            return Ok(result);
        }

        // GET: api/ventas/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<VentaDto>> GetVentaById(
            Guid id,
            CancellationToken cancellationToken)
        {
            var ventas = await _mediator.Send(
                new ListVentasRequest(),
                cancellationToken);

            var venta = ventas.FirstOrDefault(x => x.Id == id);
            if (venta == null)
                return NotFound();

            return Ok(venta);
        }

        // PUT: api/ventas/{id}
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<VentaDto>> UpdateVenta(
            Guid id,
            [FromBody] UpdateVentaRequest request,
            CancellationToken cancellationToken)
        {
            if (request == null || id != request.Id)
                return BadRequest("Datos inválidos.");

            try
            {
                var ventaDto = await _mediator.Send(request, cancellationToken);
                return Ok(ventaDto);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        // DELETE: api/ventas/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteVenta(
            Guid id,
            CancellationToken cancellationToken)
        {
            try
            {
                await _mediator.Send(
                    new DeleteVentaRequest { Id = id },
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