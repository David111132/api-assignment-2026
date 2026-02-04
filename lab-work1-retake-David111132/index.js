import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filepath = path.join(__dirname, "data.json");
const data = JSON.parse(fs.readFileSync(filepath, "utf-8"));
const app = express();




app.get("/api/students", (req, res) => {
  res.json(data.students);
});


app.get("/api/students/:id", (req, res) => {
  const student = data.students.find(
    s => s.id === parseInt(req.params.id)
  );

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
});

/* ================= INSTRUCTORS ================= */

app.get("/api/instructors", (req, res) => {
  res.json(data.instructors);
});

app.get("/api/instructors/:id", (req, res) => {
  const instructor = data.instructors.find(
    i => i.id === parseInt(req.params.id)
  );

  if (!instructor) {
    return res.status(404).json({ message: "Instructor not found" });
  }

  res.json(instructor);
});

/* ================= COURSES ================= */

app.get("/api/courses", (req, res) => {
  res.json(data.courses);
});

app.get("/api/courses/:id", (req, res) => {
  const course = data.courses.find(
    c => c.id === parseInt(req.params.id)
  );

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  res.json(course);
});

/* ================= ENROLLMENTS ================= */

app.get("/api/enrollments", (req, res) => {
  res.json(data.enrollments);
});

app.get("/api/enrollments/:id", (req, res) => {
  const enrollment = data.enrollments.find(
    e => e.id === parseInt(req.params.id)
  );

  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  res.json(enrollment);
});

/* ================= ASSIGNMENTS ================= */

app.get("/api/assignments", (req, res) => {
  res.json(data.assignments);
});

app.get("/api/assignments/:id", (req, res) => {
  const assignment = data.assignments.find(
    a => a.id === parseInt(req.params.id)
  );

  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  res.json(assignment);
});

/* ================= GRADES ================= */

app.get("/api/grades", (req, res) => {
  res.json(data.grades);
});

app.get("/api/grades/:id", (req, res) => {
  const grade = data.grades.find(
    g => g.id === parseInt(req.params.id)
  );

  if (!grade) {
    return res.status(404).json({ message: "Grade not found" });
  }

  res.json(grade);
});

/* ================= SERVER ================= */

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
app.get("/api/students/:id/enrollments", (req, res) => {
  const studentId = parseInt(req.params.id);

  const enrollments = data.enrollments.filter(
    e => e.studentId === studentId
  );

  if (enrollments.length === 0) {
    return res.status(404).json({ message: "No enrollments found for this student" });
  }

  res.json(enrollments);
});
app.get("/api/students/:id/courses", (req, res) => {
  const studentId = parseInt(req.params.id);

  const enrollments = data.enrollments.filter(
    e => e.studentId === studentId
  );

  const courses = enrollments.map(enrollment =>
    data.courses.find(course => course.id === enrollment.courseId)
  );

  res.json(courses);
});
app.get("/api/courses/:id/students", (req, res) => {
  const courseId = parseInt(req.params.id);

  const enrollments = data.enrollments.filter(
    e => e.courseId === courseId
  );

  const students = enrollments.map(enrollment =>
    data.students.find(student => student.id === enrollment.studentId)
  );

  res.json(students);
});
app.get("/api/instructors/:id/courses", (req, res) => {
  const instructorId = parseInt(req.params.id);

  const courses = data.courses.filter(
    c => c.instructorId === instructorId
  );

  res.json(courses);
});
app.get("/api/courses/:id/assignments", (req, res) => {
  const courseId = parseInt(req.params.id);

  const assignments = data.assignments.filter(
    a => a.courseId === courseId
  );

  res.json(assignments);
});
app.get("/api/enrollments/:id/grades", (req, res) => {
  const enrollmentId = parseInt(req.params.id);

  const grades = data.grades.filter(
    g => g.enrollmentId === enrollmentId
  );

  res.json(grades);
});
app.get("/api/students/:id/gpa", (req, res) => {
  const studentId = parseInt(req.params.id);

  const enrollments = data.enrollments.filter(
    e => e.studentId === studentId && e.grade
  );

  if (enrollments.length === 0) {
    return res.status(404).json({ message: "No graded enrollments found" });
  }

  const gradePoints = {
    A: 4.0,
    B: 3.0,
    C: 2.0,
    D: 1.0,
    F: 0.0
  };

  const totalPoints = enrollments.reduce((sum, e) => {
    return sum + (gradePoints[e.grade] ?? 0);
  }, 0);

  const gpa = (totalPoints / enrollments.length).toFixed(2);

  res.json({ studentId, gpa });
});
app.get("/api/courses/:id/average", (req, res) => {
  const courseId = parseInt(req.params.id);

  const enrollments = data.enrollments.filter(
    e => e.courseId === courseId
  );

  const enrollmentIds = enrollments.map(e => e.id);

  const grades = data.grades.filter(
    g => enrollmentIds.includes(g.enrollmentId)
  );

  if (grades.length === 0) {
    return res.status(404).json({ message: "No grades found for this course" });
  }

  const total = grades.reduce((sum, g) => sum + g.score, 0);
  const average = (total / grades.length).toFixed(2);

  res.json({ courseId, average });
});
app.get("/api/instructors/:id/students", (req, res) => {
  const instructorId = parseInt(req.params.id);

  const courses = data.courses.filter(
    c => c.instructorId === instructorId
  );

  const courseIds = courses.map(c => c.id);

  const enrollments = data.enrollments.filter(
    e => courseIds.includes(e.courseId)
  );

  const students = enrollments.map(e =>
    data.students.find(s => s.id === e.studentId)
  );

  // Remove duplicates
  const uniqueStudents = [
    ...new Map(students.map(s => [s.id, s])).values()
  ];

  res.json(uniqueStudents);
});
app.get("/api/students/:id/schedule", (req, res) => {
  const studentId = parseInt(req.params.id);

  const enrollments = data.enrollments.filter(
    e => e.studentId === studentId
  );

  const schedule = enrollments.map(e => {
    const course = data.courses.find(
      c => c.id === e.courseId
    );

    return {
      courseCode: course.code,
      courseName: course.name,
      schedule: course.schedule,
      semester: e.semester
    };
  });

  res.json(schedule);
});




