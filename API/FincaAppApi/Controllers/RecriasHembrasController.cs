using FincaAppApplication.DTOs.RecriaHembra;
using FincaAppApplication.Features.Requests.RecriasHembraRecuest;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FincaAppApi.Controllers
{
    [ApiController]
    [Route("api/recrias-hembras")]
    public class RecriasHembrasController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RecriasHembrasController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<List<RecriaHembraDto>>> List(CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new ListRecriasHembrasRequest(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RecriaHembraDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetRecriaHembraByIdRequest { Id = id }, cancellationToken);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> Create([FromBody] CreateRecriaHembraRequest request, CancellationToken cancellationToken)
        {
            var id = await _mediator.Send(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id }, id);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRecriaHembraRequest request, CancellationToken cancellationToken)
        {
            request.Id = id;
            await _mediator.Send(request, cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new DeleteRecriaHembraRequest { Id = id }, cancellationToken);
            return NoContent();
        }
    }
}