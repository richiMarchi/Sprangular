import {Injectable} from '@angular/core';

import {Student} from '../models/student.model';
import {from, Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {catchError, map, mergeMap, tap, toArray} from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';
import {Course} from '../models/course.model';
import {environment} from 'src/environments/environment';

/** StudentService service
 *
 *  This service is responsible of all the interaction with students resources through Rest api.
 */
@Injectable({
  providedIn: 'root'
})
export class StudentService {
  constructor(private http: HttpClient,
              private toastrService: ToastrService) {
  }

  /**
   * Function to enroll students to a specific Course
   * Return value is ignored, since the we reload the entire list
   *
   * @param(students) the list of students to be enrolled
   * @param(course) the objective course
   */
  enrollStudents(students: Student[], course: Course): Observable<Student[]> {
    return from(students).pipe(
        mergeMap((student: Student) => {
          // Checking if ADD has been pressed without selecting a student (or modifying the selected one)
          if (typeof student === 'string') {
            this.toastrService.error(`${student} is not a valid Student, please select one from the options`, 'Error 😅');
            return of(null);
          }
          // Faking enroll
          student.courseId = course.id;
          return this.http.put<Student>(`${environment.base_students_url}/${student.id}`,
              Student.export(student), environment.base_http_headers).pipe(
              tap(s => {
                this.toastrService.success(`Enrolled ${Student.displayFn(s)} to ${course.name}`, 'Congratulations 😃');
                console.log(`enrolled ${Student.displayFn(s)} - enrollStudents()`);
              }),
              catchError(this.handleError<Student>(`enrollStudents(${Student.displayFn(student)}, ${course.name})`))
          );
        }),
        toArray()
    );
  }

  /**
   * Function to unenroll students from a specific course.
   * Return value is ignored, since the we reload the entire list
   *
   * @param(students) the list of students to be unenrolled
   * @param(course) the objective course
   */
  unenrollStudents(students: Student[], course: Course): Observable<Student[]> {
    return from(students).pipe(
        mergeMap(student => {
          // Faking unenroll, remove also the team
          student.courseId = 0;
          student.teamId = 0;
          return this.http.put<Student>(`${environment.base_students_url}/${student.id}`,
              Student.export(student), environment.base_http_headers).pipe(
              tap(s => {
                this.toastrService.success(`Unenrolled ${Student.displayFn(s)} from ${course.name}`, 'Congratulations 😃');
                console.log(`unenrolled ${Student.displayFn(s)} - unenrollStudents()`);
              }),
              catchError(this.handleError<Student>(`unenrollStudents(${Student.displayFn(student)}, ${course.name})`))
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
    return this.http.get<Student[]>(`${environment.base_students_url}?surname_like=${name}`).pipe(
        // If I don't know a priori which data the server sends me --> map(res => res.map(r => Object.assign(new Student(), r))),
        tap(x => console.log(`found ${x.length} results matching ${name} - searchStudents()`)),
        catchError(this.handleError<Student[]>(`searchStudents(${name})`, [], false))
    );
  }

  searchStudentsInCourseAvailable(name: string, course: Course, all: boolean = false): Observable<Student[]> {
    // Checking if it is actually a string and does not have whitespaces in the middle (if it has them at beginning or end, trim)
    if (course === undefined || !all && (typeof name !== 'string')) {
      return of([]);
    } else {
      name = name.trim();
      if (!name || name.indexOf(' ') >= 0) {
        return of([]);
      }
    }
    return this.http.get<Student[]>(`${environment.base_students_url}?surname_like=${name}&courseId=${course.id}&teamId=0`).pipe(
        // If I don't know a priori which data the server sends me --> map(res => res.map(r => Object.assign(new Student(), r))),
        tap(x => console.log(`found ${x.length} results matching ${name} - searchStudents()`)),
        catchError(this.handleError<Student[]>(`searchStudents(${name})`, [], false))
    );
  }

  public getStudentCourses(email: string): Observable<Course[]> {
    return this.http.get<Student[]>(`${environment.base_students_url}?email_like=${email}&_expand=course`)
        .pipe(
            map(students => [students.shift().course]),
            tap(() => console.log(`fetched student ${email} courses - getUserCourses()`)),
            catchError(this.handleError<Course[]>(`getUserCourses(${email})`))
        );
  }

  public getStudentByEmail(email: string): Observable<Student> {
    return this.http.get<Student[]>(`${environment.base_students_url}?email_like=${email}&_expand=team`)
        .pipe(
            map(x => x.shift()),
            tap(() => console.log(`fetched student with email ${email} - getStudentByEmail()`)),
            catchError(this.handleError<Student>(`getStudentByEmail(${email})`))
        );
  }

  public getStudentsInTeam(teamId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${environment.base_students_url}?teamId=${teamId}`)
        .pipe(
            tap(() => console.log(`fetched student in team ${teamId} - getStudentInTeam()`)),
            catchError(this.handleError<Student[]>(`getStudentInTeam(${teamId})`))
        );
  }

  public setStudentTeam(teamId: number, student: Student): Observable<Student> {
    student.teamId = teamId;
    return this.http.put<Student>(`${environment.base_students_url}/${student.id}`, student, environment.base_http_headers).pipe(
        tap(() => console.log(`updated student ${student.id} in team ${teamId} - setStudentTeam()`)),
        catchError(this.handleError<Student>(`setStudentTeam(${teamId}, ${student.id})`))
    );
  }

  /**
   * Function to retrieve all students (including their teams if any)
   */
  private getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${environment.base_students_url}?_expand=team`)
        .pipe(
            // If I don't know a priori which data the server sends me --> map(res => res.map(r => Object.assign(new Student(), r))),
            tap(_ => console.log('fetched students - getStudents()')),
            catchError(this.handleError<Student[]>('getStudents()'))
        );
  }
/*
  /**
   * Function to create students
   *
   * @param(students) the students to be created
   *
   private createStudents(students: Student[]) : Observable<Student[]> {
    return from(students).pipe(
      mergeMap(student => {
        return this.http.post<Student>(`${this.baseURL}`, Student.export(student), this.httpOptions).pipe(
          tap(s => {
            this.toastrService.success(`Created ${Student.displayFn(s)}`, 'Congratulations 😃');
            console.log(`created student ${Student.displayFn(s)} - createStudent()`);
          }),
          catchError(this.handleError<Student>(`createStudent(${Student.displayFn(student)})`))
        )
      }),
      toArray()
    );
  }

  /**
   * Function to delete students
   *
   * @param(students) the students to be deleted
   *
   private deleteStudents(students: Student[]) {
    return from(students).pipe(
      mergeMap(student => {
        return this.http.delete(`${this.baseURL}/students/${student.id}`).pipe(
          tap(() => {
            this.toastrService.success(`Deleted ${Student.displayFn(student)}`, 'Congratulations 😃');
            console.log(`Deleted student ${Student.displayFn(student)} - deleteStudent()`);
          }),
          catchError(this.handleError<Student>(`deleteStudent(${Student.displayFn(student)})`))
        );
      })
    );
  }/
*/

   /**
    * Handle Http operation that failed.
    * Let the app continue.
    * @param operation - name of the operation that failed
    * @param result - optional value to return as the observable result
    * @param show - is it visible
    * @param message - error message
    */
  private handleError<T>(operation = 'operation',
                         result?: T,
                         show: boolean = true,
                         message: string = 'An error occurred while performing') {
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
