using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppDomain.Common;
public interface ITenantProvider
{
    string TenantId { get; }
}
