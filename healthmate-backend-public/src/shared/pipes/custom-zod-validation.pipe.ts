import { UnprocessableEntityException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';
// Pipe process validation and transformation before throwing to controller
// Target: Show path to section of code that causes the error
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
