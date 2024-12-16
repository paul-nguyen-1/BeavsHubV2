export class CreateCourseDto {
    readonly name: string;
    readonly course?: string;
    readonly date?: Date;
    readonly classPairing?: string;
    readonly comment?: string;
    readonly timeSpent?: string;
    readonly difficulty?: number;
  }
  