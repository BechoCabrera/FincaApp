using FincaAppApplication.DTOs.CriaHembra;
using FincaAppApplication.Features.Requests.CriaHembraRequest;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FincaAppApi.Controllers;

[ApiController]
[Route("api/crias-hembras")]
public class CriasHembrasController : ControllerBase
{
    private readonly IMediator _mediator;

    public CriasHembrasController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCriaHembraDto dto)
    {
        var id = await _mediator.Send(new CreateCriaHembraRequest { Dto = dto });
        return CreatedAtAction(nameof(GetById), new { id }, null);
    }

    [HttpGet]
    public async Task<ActionResult<List<CriaHembraDto>>> List()
    {
        var result = await _mediator.Send(new ListCriaHembrasRequest());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CriaHembraDto>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetCriaHembraByIdRequest { Id = id });
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateCriaHembraDto dto)
    {
        await _mediator.Send(new UpdateCriaHembraRequest { Id = id, Dto = dto });
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteCriaHembraRequest { Id = id });
        return NoContent();
    }
}