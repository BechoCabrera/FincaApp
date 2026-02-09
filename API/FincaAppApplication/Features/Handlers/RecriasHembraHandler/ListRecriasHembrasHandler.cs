using AutoMapper;
using FincaAppApplication.DTOs.RecriaHembra;
using FincaAppApplication.Features.Requests.RecriasHembraRecuest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.RecriasHembraHandler
{
    public class ListRecriasHembrasHandler : IRequestHandler<ListRecriasHembrasRequest, List<RecriaHembraDto>>
    {
        private readonly IRecriaHembraRepository _repository;
        private readonly IMapper _mapper;

        public ListRecriasHembrasHandler(IRecriaHembraRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<RecriaHembraDto>> Handle(ListRecriasHembrasRequest request, CancellationToken cancellationToken)
        {
            var entities = await _repository.GetAllAsync(cancellationToken);
            return _mapper.Map<List<RecriaHembraDto>>(entities);
        }
    }
}
