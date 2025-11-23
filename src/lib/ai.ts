import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Define the schema for the workout plan
const workoutPlanSchema = z.object({
  programName: z.string().describe('Name of the workout program (e.g., Hypertrophy ABC, Fat Loss Circuit)'),
  description: z.string().describe('Brief description of the program goals and methodology'),
  durationWeeks: z.number().describe('Duration of the program in weeks'),
  workouts: z.array(
    z.object({
      name: z.string().describe('Name of the workout session (e.g., Push Day, Leg Day)'),
      description: z.string().optional().describe('Notes about this specific workout'),
      dayOffset: z.number().describe('Day number in the sequence (0 for first day, 1 for second, etc.)'),
      exercises: z.array(
        z.object({
          name: z.string().describe('Name of the exercise'),
          sets: z.number().describe('Number of sets'),
          reps: z.number().describe('Number of repetitions per set'),
          notes: z.string().optional().describe('Technique notes or tempo instructions'),
        })
      ),
    })
  ),
});

export async function generateWorkoutPlan(goal: string, experienceLevel: string, daysPerWeek: number, equipment: string = 'Gym') {
  const prompt = `
    Create a workout program for a ${experienceLevel} level individual with the goal of "${goal}".
    They can train ${daysPerWeek} days per week and have access to: ${equipment}.
    
    The program should be structured logically (e.g., Split, Full Body) and last for 4 weeks (just generate the unique workouts that repeat).
    Ensure exercises are standard and names are clear.
    Include specific set/rep ranges suitable for the goal.
  `;

  const result = await generateObject({
    model: google('gemini-1.5-pro-latest'),
    schema: workoutPlanSchema,
    prompt: prompt,
  });

  return result.object;
}

// Define the schema for diet suggestions (if needed)
const dietSuggestionSchema = z.object({
  dailyCalories: z.number(),
  macros: z.object({
    carbs: z.number(),
    protein: z.number(),
    fats: z.number(),
  }),
  mealSuggestions: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      ingredients: z.array(z.string()),
    })
  ),
});

export async function generateDietSuggestion(goal: string, currentWeight: number, height: number, age: number, gender: string, activityLevel: string) {
  const prompt = `
    Calculate daily calorie and macro targets for a ${age} year old ${gender}, ${height}cm, ${currentWeight}kg.
    Activity Level: ${activityLevel}.
    Goal: ${goal}.
    
    Provide 3 simple meal suggestions using common ingredients.
  `;

  const result = await generateObject({
    model: google('gemini-1.5-pro-latest'),
    schema: dietSuggestionSchema,
    prompt: prompt,
  });

  return result.object;
}
