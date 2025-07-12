import { MenuItem } from '../models/menu.model';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'Base',
      separator: false,
      items: [
        // {
        //   icon: 'assets/icons/heroicons/outline/chart-pie.svg',
        //   label: 'Tablero',
        //   route: '/dashboard',
        //   children: [{ label: 'NFTs', route: '/dashboard/nfts' }],
        // },
        // {
        //   icon: 'assets/icons/heroicons/outline/lock-closed.svg',
        //   label: 'Autenticación',
        //   route: '/auth',
        //   children: [
        //     { label: 'Registrarse', route: '/auth/sign-up' },
        //     { label: 'Iniciar sesión', route: '/auth/sign-in' },
        //     { label: 'Recuperar contraseña', route: '/auth/forgot-password' },
        //     { label: 'Nueva contraseña', route: '/auth/new-password' },
        //     { label: 'Doble verificación', route: '/auth/two-steps' },
        //   ],
        // },
        // {
        //   icon: 'assets/icons/heroicons/outline/exclamation-triangle.svg',
        //   label: 'Errores',
        //   route: '/errors',
        //   children: [
        //     { label: 'Error 404', route: '/errors/404' },
        //     { label: 'Error 500', route: '/errors/500' },
        //   ],
        // },
        // {
        //   icon: 'assets/icons/heroicons/outline/cube.svg',
        //   label: 'Componentes',
        //   route: '/components',
        //   children: [{ label: 'Tabla', route: '/components/table' }],
        // },
        {
          icon: 'assets/icons/heroicons/outline/document-text.svg',
          label: 'Registro Ganadería',
          route: '/ganaderia',
          children: [
            {
              label: 'Registro Hembras',
              route: '/ganaderia/hembras',
              icon: 'assets/icons/heroicons/outline/user-group.svg',
              children: [
                { label: 'Vacas Paridas', route: '/ganaderia/hembras/paridas', icon: 'assets/icons/heroicons/outline/sparkles.svg' },
                { label: 'Vacas Escotera', route: '/ganaderia/hembras/escotera', icon: 'assets/icons/heroicons/outline/folder.svg' },
                { label: 'Crías', route: '/ganaderia/hembras/crias', icon: 'assets/icons/heroicons/outline/document-duplicate.svg' },
              ],
            },
            {
              label: 'Registro Machos',
              route: '/ganaderia/machos',
              icon: 'assets/icons/heroicons/outline/user.svg',
              children: [
                { label: 'Toros', route: '/ganaderia/machos/toros', icon: 'assets/icons/heroicons/outline/fire.svg' },
                { label: 'Crías', route: '/ganaderia/machos/crias', icon: 'assets/icons/heroicons/outline/document-duplicate.svg' },
              ],
            },
          ],
        }

      ],
    },
  ];
}
