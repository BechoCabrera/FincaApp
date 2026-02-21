using FincaAppDomain.Common;
using System;

namespace FincaAppDomain.Entities
{
    public class Venta : BaseEntity
    {
        public string Categoria { get; set; } = null!;
        public Guid AnimalId { get; set; }
        public DateTime FechaVenta { get; set; }
        public string? Comprador { get; set; }
        public decimal? Precio { get; set; }
        public string? Notas { get; set; }

        protected Venta() { }

        public Venta(string categoria, Guid animalId, DateTime fechaVenta, string? comprador, decimal? precio, string? notas)
        {
            Categoria = categoria;
            AnimalId = animalId;
            FechaVenta = fechaVenta;
            Comprador = comprador;
            Precio = precio;
            Notas = notas;
        }
    }
}
