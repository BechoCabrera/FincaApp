using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using FincaAppApplication.Features.Animals.Queries;
using FincaAppApplication.DTOs.Animal;
using FincaAppApplication.Features.Animals.Commands;
using FincaAppApplication.Features.Salidas.Commands;
using FincaAppApplication.DTOs; // TimelineEventDto

namespace FincaAppApi.Controllers;

[ApiController]
[Route("api/animals")]
[Authorize]
public class AnimalsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AnimalsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<AnimalDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] GetAnimalsQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AnimalDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var animal = await _mediator.Send(new GetAnimalByIdQuery { Id = id });
        return Ok(animal);
    }

    [HttpGet("{id:guid}/timeline")]
    [ProducesResponseType(typeof(PagedResultDto<TimelineEventDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTimeline(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var query = new GetAnimalTimelineQuery { AnimalId = id, Page = page, PageSize = pageSize };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    // Replace create with upsert behavior to avoid duplicates from UI flows
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOrUpdate([FromBody] CreateAnimalRequestDto request)
    {
        var command = new CreateOrUpdateAnimalCommand { Request = request };
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // explicit upsert endpoint for clarity/back-compat
    [HttpPost("upsert")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Upsert([FromBody] CreateAnimalRequestDto request)
    {
        var command = new CreateOrUpdateAnimalCommand { Request = request };
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{id:guid}/change-state")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangeState(Guid id, [FromBody] ChangeAnimalStateCommand request)
    {
        if (request.AnimalId == Guid.Empty) request.AnimalId = id;
        await _mediator.Send(request);
        return NoContent();
    }

    [HttpPost("{id:guid}/move")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Move(Guid id, [FromBody] MoveAnimalCommand request)
    {
        if (request.AnimalId == Guid.Empty) request.AnimalId = id;
        await _mediator.Send(request);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        var command = new DeactivateAnimalCommand { AnimalId = id };
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/salidas")]
    public async Task<IActionResult> CreateSalida(Guid id, [FromBody] CreateSalidaCommand command)
    {
        if (id != command.AnimalId) return BadRequest("AnimalId mismatch");
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result }, new { id = result });
    }
}
