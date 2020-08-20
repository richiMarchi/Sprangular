package it.polito.ai.lab2.services;

import it.polito.ai.lab2.dtos.CourseDTO;
import it.polito.ai.lab2.dtos.ProfessorDTO;
import it.polito.ai.lab2.dtos.StudentDTO;

import java.util.List;
import java.util.Optional;

public interface CourseService {

    boolean addCourse(CourseDTO course);

    Optional<CourseDTO> getCourse(String name);

    List<CourseDTO> getAllCourses();

    List<StudentDTO> getEnrolledStudents(String courseName);

    void enableCourse(String courseName);

    void disableCourse(String courseName);

    List<ProfessorDTO> getCourseProfessors(String name);

    boolean addProfessorToCourse(String professor, String name);

    boolean removeProfessorFromCourse(String professor, String name);

    List<CourseDTO> getProfessorCourses(String id);
}
