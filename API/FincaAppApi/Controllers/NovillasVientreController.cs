using FincaAppApplication.DTOs.NovillaVientre;
using FincaAppApplication.Features.Requests.NovillaVientreRequest;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FincaAppApi.Controllers
{
    [ApiController]
    [Route("api/novillas-vientre")]
    public class NovillasVientreController : ControllerBase
    {
        private readonly IMediator _mediator;

        public NovillasVientreController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<List<NovillaVientreDto>>> List(CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new ListNovillasVientreRequest(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NovillaVientreDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetNovillaVientreByIdRequest { Id = id }, cancellationToken);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> Create([FromBody] CreateNovillaVientreRequest request, CancellationToken cancellationToken)
        {
            var id = await _mediator.Send(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id }, id);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNovillaVientreRequest request, CancellationToken cancellationToken)
        {
            request.Id = id;
            await _mediator.Send(request, cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new DeleteNovillaVientreRequest { Id = id }, cancellationToken);
            return NoContent();
        }
    }
}