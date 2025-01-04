import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '../entities/usuarios/usuarios.entity';
import { ROLES_KEY } from 'src/helpers/roleDetector';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Verifica si el usuario tiene al menos uno de los roles requeridos
    return requiredRoles.some((role) => user.rol === role);
  }
}
