using AutoMapper;
using FincaAppApi.DTOs.Toro;
using FincaAppApplication.Features.Requests.ToroRequest;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.ToroHandler
{
    public class GetToroByIdHandler : IRequestHandler<GetToroByIdRequest, ToroDto>
    {
        private readonly IToroRepository _toroRepository;
        private readonly IMapper _mapper;

        public GetToroByIdHandler(IToroRepository toroRepository, IMapper mapper)
        {
            _toroRepository = toroRepository;
            _mapper = mapper;
        }

        public async Task<ToroDto> Handle(GetToroByIdRequest request, CancellationToken cancellationToken)
        {
            Toro? toro = await _toroRepository.GetByIdAsync(request.Id);
            if (toro == null) throw new KeyNotFoundException("Toro no encontrado");
            return _mapper.Map<ToroDto>(toro);
        }
    }

}
