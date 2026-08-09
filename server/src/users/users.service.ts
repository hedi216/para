import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { customerProfile: true, employeeProfile: true },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { customerProfile: true, employeeProfile: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return user;
  }

  createCustomer(input: { email: string; passwordHash: string; firstName: string; lastName: string; phone?: string }) {
    return this.prisma.user.create({
      data: {
        ...input,
        email: input.email.toLowerCase(),
        role: UserRole.CUSTOMER,
        customerProfile: { create: {} },
      },
      include: { customerProfile: true },
    });
  }

  toPublicUser(user: { id: string; email: string; role: UserRole; firstName: string; lastName: string; phone: string | null }) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    };
  }
}
