using FincaAppApplication.DTOs.Fallecida;
using FincaAppApplication.Features.Requests.FallecidaRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.FallecidaHandler
{
    public class UpdateFallecidaHandler : IRequestHandler<UpdateFallecidaRequest, FallecidaDto>
    {
        private readonly IFallecidaRepository _fallecidaRepository;

        public UpdateFallecidaHandler(IFallecidaRepository fallecidaRepository)
        {
            _fallecidaRepository = fallecidaRepository;
        }

        public async Task<FallecidaDto> Handle(UpdateFallecidaRequest request, CancellationToken cancellationToken)
        {
            var fallecida = await _fallecidaRepository.GetByIdAsync(request.Id, cancellationToken);
            if (fallecida == null)
                throw new KeyNotFoundException();

            fallecida.Categoria = request.Categoria;
            fallecida.AnimalId = request.AnimalId;
            fallecida.FechaFallecimiento = request.FechaFallecimiento;
            fallecida.Causa = request.Causa;
            fallecida.Notas = request.Notas;
            fallecida.TenantId = request.TenantId;

            await _fallecidaRepository.UpdateAsync(fallecida, cancellationToken);

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
