// Exercise helpers shared by Dashboard (Goals planner) and Fitness, kept separate so
// importing them does not pull the whole Fitness tab into the initial bundle.
export function exEmoji(name:string){ const n=name.toLowerCase();
  if(/(squat|lunge|leg press|leg extension|hip thrust|glute|calf|split squat)/.test(n)) return "🦵";
  if(/curl/.test(n)) return "💪";
  if(/(plank|ab wheel|crunch)/.test(n)) return "🧘";
  if(/(pull-?up|chin|pulldown|lat)/.test(n)) return "🧗";
  if(/(deadlift|row|shrug|farmer)/.test(n)) return "🏋️";
  return "🏋️"; }
export function demoLink(name:string){ return "https://www.youtube.com/results?search_query="+encodeURIComponent(name+" proper form"); }

export const HOWTO: Record<string,string> = {
  "Bench Press":"Lie flat, grip the bar slightly wider than shoulders. Unrack, lower the bar to mid-chest with elbows about 45°, then press up until arms lock. Keep shoulder blades pinched and feet planted.",
  "Incline Dumbbell Press":"Set the bench to 30–45°. Start with dumbbells at shoulder level, press up and slightly together until arms extend, then lower slowly to feel the upper-chest stretch.",
  "Machine Chest Press":"Sit with back flat and handles at chest height. Push forward until arms are straight, squeeze the chest, and return under control without letting the stack slam.",
  "Cable Fly":"Set pulleys high, step forward with a slight lean and soft elbows. Bring the handles together in front of your chest in a hugging arc, squeeze, then control the stretch back.",
  "Shoulder Press":"Seated or standing, start at shoulder height and press overhead without flaring the ribs. Lower back to ear level under control.",
  "Lateral Raise":"Slight bend in the elbows, raise the dumbbells out to the sides to shoulder height leading with the elbows, then lower slowly. No swinging.",
  "Rear Delt Fly":"Hinge at the hips, arms hanging. Raise the dumbbells out to the sides squeezing the rear delts, keep the neck neutral and elbows soft.",
  "Arnold Press":"Start with dumbbells at shoulder height, palms facing you. Press overhead while rotating your palms to face forward, then reverse the rotation on the way down. Hits all three delt heads.",
  "Tricep Pushdown":"Elbows pinned to your sides, push the bar/rope down until arms lock and squeeze the triceps, then return to 90° without letting elbows drift.",
  "Overhead Tricep Extension":"Hold a weight overhead, keep elbows narrow, lower behind your head by bending the elbows, then extend back up.",
  "Dips":"Support on parallel bars, lean slightly forward, lower until elbows reach ~90°, then press back up to lockout.",
  "Push-ups":"Hands under shoulders, body in a straight line. Lower the chest toward the floor with elbows ~45°, then push back up bracing the core.",
  "Plank":"Forearms under shoulders, body dead straight. Brace the core and glutes and hold — don't let the hips sag or pike.",
  "Deadlift":"Bar over mid-foot, hinge and grip just outside the knees. Flat back, chest up — drive through the floor and stand tall locking the hips, then lower with control.",
  "Lat Pulldown":"Grip wide, lean back slightly. Pull the bar to your upper chest driving the elbows down and squeezing the lats; control the bar back up.",
  "Pull-ups":"Hang with a full stretch, pull your chest toward the bar by driving the elbows down and back, then lower all the way under control.",
  "Barbell Row":"Hinge to ~45° with a flat back. Row the bar to your lower ribs squeezing the back, then lower controlled. Avoid jerking with the lower back.",
  "Seated Cable Row":"Sit tall, pull the handle to your torso squeezing the shoulder blades together, then extend the arms without rounding the back.",
  "Single Arm Row":"One knee and hand on the bench, back flat. Row the dumbbell to your hip squeezing the lat, then lower slowly for a full stretch.",
  "Face Pull":"Set the rope at face height. Pull toward your face flaring the elbows out and squeezing the rear delts/upper back; control the return.",
  "Barbell Curl":"Elbows at your sides, curl the bar up squeezing the biceps, then lower slowly. Keep the torso still — no swinging.",
  "Hammer Curl":"Neutral grip (palms facing each other), curl the dumbbells up and lower under control. Great for biceps and forearms.",
  "Preacher Curl":"Arms resting on the pad, curl the weight up fully, then lower slowly and control the stretch at the bottom.",
  "Shrugs":"Hold the weights at your sides, elevate the shoulders straight up toward your ears, squeeze the traps, then lower fully.",
  "Farmer Walk":"Hold heavy dumbbells at your sides, brace the core, stand tall and walk with controlled steps.",
  "Squat":"Bar on upper back, feet shoulder-width. Sit down and back until thighs reach about parallel, then drive up through mid-foot keeping the chest up.",
  "Romanian Deadlift":"Soft knees, push the hips back lowering the bar along your legs until you feel a hamstring stretch, then drive the hips forward to stand.",
  "Leg Press":"Feet shoulder-width on the platform. Lower until knees reach ~90°, then press back without harshly locking the knees.",
  "Walking Lunges":"Step forward and lower the back knee toward the floor, then push through the front heel to rise and step through. Keep the torso upright.",
  "Leg Extension":"Extend your knees to straighten the legs and squeeze the quads at the top, then lower under control.",
  "Hamstring Curl":"Curl the pad toward your glutes squeezing the hamstrings, then control the return without letting it drop.",
  "Bulgarian Split Squat":"Rear foot on a bench, lower into the front leg until the thigh is about parallel, then drive up through the front heel.",
  "Standing Calf Raise":"Rise onto your toes as high as possible squeezing the calves, then lower for a deep stretch. Full range each rep.",
  "Seated Calf Raise":"Knees bent under the pad, raise the heels and squeeze the calves, then lower slowly for the stretch.",
  "Hip Thrust":"Upper back on a bench, bar over the hips. Drive the hips up until the body is level, squeeze the glutes hard, then lower.",
  "Glute Bridge":"Lie on the floor, feet flat. Drive the hips up squeezing the glutes, hold briefly, then lower under control.",
  "Ab Wheel":"Kneel holding the wheel, brace the core and roll forward as far as you can control, then pull back — never let the lower back arch.",
};
