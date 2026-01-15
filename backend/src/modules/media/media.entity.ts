import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('media')
@Index(['type'])
@Index(['sourceUrl'])
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sourceUrl: string;

  @Column()
  mediaUrl: string;

  @Column({
    type: 'enum',
    enum: ['image', 'video'],
  })
  type: 'image' | 'video';

  @Column({ nullable: true })
  alt: string;

  @Column({ nullable: true })
  title: string;

  @CreateDateColumn()
  createdAt: Date;
}
