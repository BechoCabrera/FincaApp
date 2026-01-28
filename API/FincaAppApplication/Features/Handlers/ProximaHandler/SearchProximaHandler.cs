using AutoMapper;
using FincaAppApplication.DTOs.Proxima;
using FincaAppApplication.Features.Requests.ProximasRequest;
using FincaAppDomain.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.ProximaHandler
{
    public class SearchProximaHandler : IRequestHandler<SearchProximaRequest, List<ProximaDto>>
    {
        private readonly IProximaRepository _proximaRepository;
        private readonly IMapper _mapper;

        public SearchProximaHandler(IProximaRepository proximaRepository, IMapper mapper)
        {
            _proximaRepository = proximaRepository;
            _mapper = mapper;
        }

        public async Task<List<ProximaDto>> Handle(SearchProximaRequest request, CancellationToken cancellationToken)
        {
            var data = await _proximaRepository.GetAllAsync(cancellationToken);

            if (!string.IsNullOrWhiteSpace(request.Query))
            {
                var q = request.Query.ToLower();
                data = data
                    .Where(x =>
                        x.Nombre.ToLower().Contains(q) ||
                        x.Numero.ToString().Contains(q))
                    .ToList();
            }

            if (request.FincaId.HasValue)
            {
                data = data
                    .Where(x => x.FincaId == request.FincaId)
                    .ToList();
            }

            return _mapper.Map<List<ProximaDto>>(data);
        }
    }
}
