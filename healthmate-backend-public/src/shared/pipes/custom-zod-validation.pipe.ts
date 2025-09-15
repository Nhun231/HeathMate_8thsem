import { UnprocessableEntityException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

const CustomMyZodValidationPipe: any = createZodValidationPipe({
  createValidationException: (error: ZodError) => {
    // console.log(error.issues);
    return new UnprocessableEntityException(
      error.issues.map((issue) => {
        return {
          ...issue,
          path: issue.path.join('.'),
        };
      }),
    );
  },
});

export default CustomMyZodValidationPipe;
