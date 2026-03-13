using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using FincaAppApplication.DTOs.Parto;
using FincaAppDomain.Interfaces;

namespace FincaAppApi.Controllers;

[ApiController]
[Route("api/partos")]
[Authorize]
public class PartosController : ControllerBase
{
    private readonly IPartoRepository _partoRepository;
    private readonly IMediator _mediator;

    public PartosController(IPartoRepository partoRepository, IMediator mediator)
    {
        _partoRepository = partoRepository;
        _mediator = mediator;
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var parto = await _partoRepository.GetByIdAsync(id);
        if (parto == null) return NotFound();

        // Map to DTO manually to avoid adding AutoMapper here
        var dto = new PartoDto
        {
            Id = parto.Id,
            AnimalMadreId = parto.AnimalMadreId,
            CriaId = parto.CriaId,
            FechaParto = parto.FechaParto,
            Observaciones = parto.Observaciones,

            CriaNumero = parto.CriaNumero,
            CriaNombre = parto.CriaNombre,
            CriaColor = parto.CriaColor,
            CriaPropietario = parto.CriaPropietario,
            CriaPesoKg = parto.CriaPesoKg,
            CriaDetalles = parto.CriaDetalles
        };

        return Ok(dto);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] PartoDto update)
    {
        var parto = await _partoRepository.GetByIdAsync(id);
        if (parto == null) return NotFound();

        // Update editable fields - choose what is allowed to edit
        parto.Observaciones = update.Observaciones;
        // allow updating cria snapshot fields too if provided
        parto.CriaNumero = update.CriaNumero;
        parto.CriaNombre = update.CriaNombre;
        parto.CriaColor = update.CriaColor;
        parto.CriaPropietario = update.CriaPropietario;
        parto.CriaPesoKg = update.CriaPesoKg;
        parto.CriaDetalles = update.CriaDetalles;

        await _partoRepository.UpdateAsync(parto);
        return NoContent();
    }
}
