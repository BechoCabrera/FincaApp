using MediatR;
using Microsoft.AspNetCore.Mvc;
using FincaAppApplication.Features.Requests.RecriasMachoRequest;
using FincaAppApplication.DTOs.RecriasMacho;

namespace FincaAppApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecriasMachosController : ControllerBase
{
    private readonly IMediator _mediator;

    public RecriasMachosController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RecriaMachoDto>>> Get([FromQuery] string? nombre)
    {
        var result = await _mediator.Send(new ListRecriasMachosRequest { Nombre = nombre });
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RecriaMachoDto>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetRecriaMachoByIdRequest { Id = id });
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<RecriaMachoDto>> Create([FromBody] CreateRecriaMachoRequest request)
    {
        var result = await _mediator.Send(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RecriaMachoDto>> Update(Guid id, [FromBody] UpdateRecriaMachoRequest request)
    {
        if (id != request.Id)
            return BadRequest();

        var result = await _mediator.Send(request);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteRecriaMachoRequest { Id = id });
        return NoContent();
    }
}