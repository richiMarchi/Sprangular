import { Injectable } from '@angular/core';

import { Student } from '../models/student.model';
import { from, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map, mergeMap, tap, toArray } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Course } from '../models/course.model';
import { environment } from 'src/environments/environment';
import { CourseService } from './course.service';

/** StudentService service
 *
 *  This service is responsible of all the interaction with students resources through Rest api.
 */
@Injectable({
  providedIn: 'root',
})
export class StudentService {
  constructor(private http: HttpClient, private toastrService: ToastrService, private courseService : CourseService) {}

  /**
   * Function to enroll students to a specific Course
   * Return value is ignored, since the we reload the entire list
   *
   * @param(students) the list of students to be enrolled
   * @param(course) the objective course
   */
  enrollStudents(students: Student[], courseId: string): Observable<Student[]> {
    return from(students).pipe(
      mergeMap((student: Student) => {
        // Checking if ADD has been pressed without selecting a student (or modifying the selected one)
        if (typeof student === 'string') {
          this.toastrService.error(
            `${student} is not a valid Student, please select one from the options`,
            'Error 😅'
          );
          return of(null);
        }
        return this.http
          .put<Student>(
            `${environment.base_students_url}/${student.id}`,
            student,
            environment.base_http_headers
          )
          .pipe(
            tap((s) => {
              this.toastrService.success(
                `Enrolled ${Student.displayFn(s)} to ${courseId}`,
                'Congratulations 😃'
              );
              console.log(
                `enrolled ${Student.displayFn(s)} - enrollStudents()`
              );
            }),
            catchError(
              this.handleError<Student>(
                `enrollStudents(${Student.displayFn(student)}, ${courseId})`
              )
            )
          );
      }),
      toArray()
    );
  }

  /**
   * Function to retrieve all students whose name matches a specific string
   *
   * @param(name) the string which should be contained in the student name
   */
  searchStudents(name: string): Observable<Student[]> {
    // Checking if it is actually a string and does not have whitespaces in the middle (if it has them at beginning or end, trim)
    if (typeof name !== 'string') {
      return of([]);
    } else {
      name = name.trim();
      if (!name || name.indexOf(' ') >= 0) {
        return of([]);
      }
    }
    return this.http
      .get<Student[]>(`${environment.base_students_url}?surname_like=${name}`)
      .pipe(
        // If I don't know a priori which data the server sends me --> map(res => res.map(r => Object.assign(new Student(), r))),
        tap((x) =>
          console.log(
            `found ${x.length} results matching ${name} - searchStudents()`
          )
        ),
        catchError(
          this.handleError<Student[]>(`searchStudents(${name})`, [], false)
        )
      );
  }

  searchStudentsInCourseAvailable(
    name: string,
    courseId: string = this.courseService.currentCourseSubject.value,
    all: boolean = false
  ): Observable<Student[]> {
    // Checking if it is actually a string and does not have whitespaces in the middle (if it has them at beginning or end, trim)
    if (courseId === undefined || (!all && typeof name !== 'string')) {
      return of([]);
    } else {
      name = name.trim();
      if (!name || name.indexOf(' ') >= 0) {
        return of([]);
      }
    }
    return this.http
      .get<Student[]>(
        `${environment.base_courses_url}/${courseId}/availableStudents?surname_like=${name}`
      )
      .pipe(
        // If I don't know a priori which data the server sends me --> map(res => res.map(r => Object.assign(new Student(), r))),
        tap((x) =>
          console.log(
            `found ${x.length} results matching ${name} - searchStudents()`
          )
        ),
        catchError(
          this.handleError<Student[]>(`searchStudents(${name})`, [], false)
        )
      );
  }

  public getStudentCourses(id: string): Observable<Course[]> {
    return this.http
      .get<Course[]>(`${environment.base_students_url}/${id}/courses`)
      .pipe(
        tap(() =>
          console.log(`fetched student ${id} courses - getUserCourses()`)
        ),
        catchError(this.handleError<Course[]>(`getUserCourses(${id})`))
      );
  }

  public getStudentByEmail(email: string): Observable<Student> {
    return this.http
      .get<Student[]>(
        `${environment.base_students_url}?email_like=${email}&_expand=team`
      )
      .pipe(
        map((x) => x.shift()),
        tap(() =>
          console.log(
            `fetched student with email ${email} - getStudentByEmail()`
          )
        ),
        catchError(this.handleError<Student>(`getStudentByEmail(${email})`))
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   * @param show - is it visible
   * @param message - error message
   */
  private handleError<T>(
    operation = 'operation',
    result?: T,
    show: boolean = true,
    message: string = 'An error occurred while performing'
  ) {
    return (error: any): Observable<T> => {
      const why = `${message} ${operation}: ${error}`;

      if (show) {
        this.toastrService.error(why, 'Error 😅');
      }
      console.log(why);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
