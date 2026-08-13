import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
  ) {}

  findAll(ownerId: string, search?: string): Promise<Project[]> {
    return this.projects.find({
      where: {
        ownerId,
        ...(search ? { name: ILike(`%${search}%`) } : {}),
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(ownerId: string, id: string): Promise<Project> {
    const project = await this.projects.findOne({ where: { id, ownerId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async create(ownerId: string, dto: CreateProjectDto): Promise<Project> {
    const project = await this.projects.save(
      this.projects.create({ ...dto, ownerId }),
    );
    // Re-read so the eager `lead` relation is populated in the response.
    return this.findOne(ownerId, project.id);
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.findOne(ownerId, id);
    Object.assign(project, dto);
    await this.projects.save(project);
    return this.findOne(ownerId, id);
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const project = await this.findOne(ownerId, id);
    await this.projects.remove(project);
  }
}
