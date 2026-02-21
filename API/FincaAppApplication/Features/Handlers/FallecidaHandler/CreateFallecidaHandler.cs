using FincaAppApplication.DTOs.Fallecida;
using FincaAppApplication.Features.Requests.FallecidaRequest;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.FallecidaHandler
{
    public class CreateFallecidaHandler : IRequestHandler<CreateFallecidaRequest, FallecidaDto>
    {
        private readonly IFallecidaRepository _fallecidaRepository;

        public CreateFallecidaHandler(IFallecidaRepository fallecidaRepository)
        {
            _fallecidaRepository = fallecidaRepository;
        }

        public async Task<FallecidaDto> Handle(CreateFallecidaRequest request, CancellationToken cancellationToken)
        {
            var fallecida = new Fallecida(
                request.Categoria,
                request.AnimalId,
                request.FechaFallecimiento,
                request.Causa,
                request.Notas
            );
            fallecida.TenantId = request.TenantId;

            await _fallecidaRepository.AddAsync(fallecida, cancellationToken);

            return new FallecidaDto
            {
                Id = fallecida.Id,
                Categoria = fallecida.Categoria,
                AnimalId = fallecida.AnimalId,
                FechaFallecimiento = fallecida.FechaFallecimiento,
                Causa = fallecida.Causa,
                Notas = fallecida.Notas,
            };
        }
    }
}
