using FluentValidation;
using FincaAppApplication.DTOs.Parto;

namespace FincaAppApplication.Validators;

public class CreatePartoRequestDtoValidator : AbstractValidator<CreatePartoRequestDto>
{
    public CreatePartoRequestDtoValidator()
    {
        RuleFor(x => x.Numero).NotEmpty().WithMessage("El número de arete de la madre es obligatorio.");
        RuleFor(x => x.FincaId).NotEmpty().WithMessage("FincaId es obligatorio.");
        RuleFor(x => x.FechaParida).NotEmpty().WithMessage("FechaParida es obligatoria.");

        // FechaParida should not be in the future (allow small clock skew)
        RuleFor(x => x.FechaParida)
            .Must(fp => fp <= DateTime.UtcNow.AddMinutes(5))
            .WithMessage("FechaParida no puede ser en el futuro");

        // If cria data is provided, validate types
        RuleFor(x => x.GeneroCria).NotEmpty().WithMessage("GeneroCria es obligatorio");

        // Optional cria fields: if present validate length/values
        RuleFor(x => x.CriaPesoKg).GreaterThan(0).When(x => x.CriaPesoKg.HasValue).WithMessage("CriaPesoKg debe ser mayor que 0");
        RuleFor(x => x.NumeroCria).MaximumLength(100);
        RuleFor(x => x.CriaNombre).MaximumLength(200);
        RuleFor(x => x.CriaPropietario).MaximumLength(200);
        RuleFor(x => x.CriaDetalles).MaximumLength(2000);

        // Validate FechaNacimiento cannot be after FechaParida
        RuleFor(x => x.FechaNacimiento)
            .LessThanOrEqualTo(x => x.FechaParida)
            .When(x => x.FechaNacimiento.HasValue)
            .WithMessage("FechaNacimiento no puede ser posterior a FechaParida");

        // FechaNacimiento should not be in the future
        RuleFor(x => x.FechaNacimiento)
            .Must(fn => fn == null || fn <= DateTime.UtcNow.AddMinutes(5))
            .WithMessage("FechaNacimiento no puede ser en el futuro");

        // FechaPalpacion should be <= FechaParida when provided
        RuleFor(x => x.FechaPalpacion)
            .LessThanOrEqualTo(x => x.FechaParida)
            .When(x => x.FechaPalpacion.HasValue)
            .WithMessage("FechaPalpacion no puede ser posterior a FechaParida");

        // FechaPalpacion should not be in the future
        RuleFor(x => x.FechaPalpacion)
            .Must(fp => fp == null || fp <= DateTime.UtcNow.AddMinutes(5))
            .WithMessage("FechaPalpacion no puede ser en el futuro");
    }
}
