using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using FincaAppApplication.DTOs.Finca;
using FincaAppApplication.Features.Fincas.Queries;
using FincaAppApplication.Features.Fincas.Commands;

namespace FincaAppApi.Controllers;

[ApiController]
[Route("api/fincas")]
[Authorize]
public class FincasController : ControllerBase
{
    private readonly IMediator _mediator;

    public FincasController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<FincaDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] GetFincasQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(FincaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetFincaByIdQuery { Id = id });
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateFincaRequestDto request)
    {
        var command = new CreateFincaCommand { Request = request };
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id }, null);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateFincaRequestDto request)
    {
        var command = new UpdateFincaCommand { Id = id, Request = request };
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var command = new DeleteFincaCommand { Id = id };
        await _mediator.Send(command);
        return NoContent();
    }
}
