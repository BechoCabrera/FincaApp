using AutoMapper;
using FincaAppApplication.DTOs.NovillaVientre;
using FincaAppApplication.Features.Requests.NovillaVientreRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.NovillaVientreHandler
{
    public class ListNovillasVientreHandler : IRequestHandler<ListNovillasVientreRequest, List<NovillaVientreDto>>
    {
        private readonly INovillaVientreRepository _repository;
        private readonly IMapper _mapper;

        public ListNovillasVientreHandler(INovillaVientreRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<NovillaVientreDto>> Handle(ListNovillasVientreRequest request, CancellationToken cancellationToken)
        {
            var entities = await _repository.GetAllAsync(cancellationToken);
            return _mapper.Map<List<NovillaVientreDto>>(entities);
        }
    }
}
