using FincaAppDomain.Common;
using static System.Runtime.InteropServices.JavaScript.JSType;
namespace FincaAppDomain.Entities;

public class Parida : BaseEntity
{
    public Guid Id { get; private set; }

    // Dato humano / visible
    public string Nombre { get; private set; } = default!;
    public string Numero { get; private set; } = default!;
    public Guid FincaId { get; private set; }
    public DateTime FechaParida { get; private set; }
    public string GeneroCria { get; private set; } = default!;

    public DateTime? FechaPalpacion { get; private set; }
    public string? TipoLeche { get; private set; }
    public string? Observaciones { get; private set; }

    protected Parida() { }

    public Parida(
        string numero,
        Guid fincaId,
        DateTime fechaParida,
        string generoCria,
        DateTime? fechaPalpacion,
        string? tipoLeche,
        string? observaciones,
        string? nombre
        )
    {
        Id = Guid.NewGuid();
        Numero = numero;
        FincaId = fincaId;
        FechaParida = fechaParida;
        GeneroCria = generoCria;
        FechaPalpacion = fechaPalpacion;
        TipoLeche = tipoLeche;
        Observaciones = observaciones;
        Nombre = nombre;
    }
}
