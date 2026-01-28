using MediatR;
using Microsoft.AspNetCore.Mvc;
using FincaAppApplication.Features.Requests.ProximasRequest;

namespace FincaAppApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProximasController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProximasController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProximaRequest request)
    {
        var result = await _mediator.Send(request);
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateProximaRequest request)
    {
        var result = await _mediator.Send(request);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteProximaRequest { Id = id });
        return NoContent();
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetProximaByIdRequest { Id = id });
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? q, [FromQuery] Guid? fincaId)
    {
        var result = await _mediator.Send(new SearchProximaRequest
        {
            Query = q,
            FincaId = fincaId
        });

        return Ok(result);
    }
}
