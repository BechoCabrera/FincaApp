using MediatR;
using System;

namespace FincaAppApplication.Features.Salidas.Commands;

public class CreateSalidaCommand : IRequest<Guid>
{
    public Guid AnimalId { get; set; }
    public int TipoSalida { get; set; } // use TipoSalida enum from domain
    public DateTime Fecha { get; set; }
    public decimal? Precio { get; set; }
    public string? Causa { get; set; }
}
