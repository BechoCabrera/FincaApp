using FincaAppDomain.Common;
namespace FincaAppDomain.Entities;
public class Paridas : BaseEntity
{
    //public Guid Id { get; set; }
    public string Nombre { get;  set; } = default!;
    public string Numero { get;  set; } = default!;

    public Guid FincaId { get;  set; }

    public string GeneroCria { get;  set; } = default!;
    public DateTime FechaParida { get;  set; }

    public DateTime? FechaPalpacion { get;  set; }
    public DateTime? FechaNacimiento { get;  set; }

    public string? Color { get;  set; }
    public string? TipoLeche { get;  set; }
    public string? Procedencia { get;  set; }
    public string? Observaciones { get;  set; }
    public string? Propietario { get;  set; }

    protected Paridas() { }

    public Paridas(
        string nombre,
        string numero,
        Guid fincaId,
        string generoCria,
        DateTime fechaParida,
        DateTime? fechaPalpacion,
        DateTime? fechaNacimiento,
        string? color,
        string? tipoLeche,
        string? procedencia,
        string? observaciones,
        string? propietario)
    {
        Id = Guid.NewGuid();
        Nombre = nombre;
        Numero = numero;
        FincaId = fincaId;
        GeneroCria = generoCria;
        FechaParida = fechaParida;
        FechaPalpacion = fechaPalpacion;
        FechaNacimiento = fechaNacimiento;
        Color = color;
        TipoLeche = tipoLeche;
        Procedencia = procedencia;
        Observaciones = observaciones;
        Propietario = propietario;
    }
}
