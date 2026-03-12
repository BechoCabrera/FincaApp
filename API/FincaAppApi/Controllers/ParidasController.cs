using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using AutoMapper;
using FincaAppApplication.DTOs.Parto;
using FincaAppApplication.Features.Partos.Commands;
using FincaAppDomain.Interfaces;

namespace FincaAppApi.Controllers;

[ApiController]
[Route("api/paridas")]
[Authorize]
public class ParidasController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IPartoRepository _partoRepository;
    private readonly IMapper _mapper;

    public ParidasController(IMediator mediator, IPartoRepository partoRepository, IMapper mapper)
    {
        _mediator = mediator;
        _partoRepository = partoRepository;
        _mapper = mapper;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePartoRequestDto request)
    {
        var command = new RegisterPartoCommand { Request = request };
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.PartoId }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<PartoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] Guid? fincaId = null)
    {
        var items = await _partoRepository.GetAllAsync(fincaId);
        var dtos = items.Select(p => _mapper.Map<PartoDto>(p)).ToList();
        return Ok(dtos);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(PartoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var p = await _partoRepository.GetByIdAsync(id);
        if (p == null) return NotFound();
        var dto = _mapper.Map<PartoDto>(p);
        return Ok(dto);
    }
}
