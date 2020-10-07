import {Component, OnDestroy, OnInit} from '@angular/core';

import {Student} from '../../models/student.model';
import {StudentService} from '../../services/student.service';
import {finalize, first, switchMap, takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {CourseService} from '../../services/course.service';

/**
 * StudentsContainer class
 *
 * It contains the StudentComponent and all the application logic
 */
@Component({
  selector: 'app-tab-students-cont',
  templateUrl: './tab-students.container.html',
})
export class TabStudentsContComponent implements OnInit, OnDestroy {

  enrolledStudents: Student[] = [];                             // The current enrolled list
  filteredStudents: Observable<Student[]>;                     // The list of students matching a criteria
  private searchTerms = new Subject<string>();                  // The search criteria emitter
  private destroy$: Subject<boolean> = new Subject<boolean>(); // Private subject to perform the unsubscriptions when component is destroyed

  constructor(private studentService: StudentService,
              private courseService: CourseService) {
    this.courseService.getEnrolledStudents().pipe(first()).subscribe(enrolled => this.enrolledStudents = enrolled);
  }

  ngOnInit(): void {
    // Subscribe to the search terms emitter
    this.filteredStudents = this.searchTerms.pipe(
        takeUntil(this.destroy$),
        // switch to new search observable each time the term changes
        switchMap((name: string) => this.studentService.searchStudents(name)),
    );
  }

  ngOnDestroy() {
    /** Destroying subscription */
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Function to push new search terms
   *
   * @param(name) the new search terms
   */
  searchStudents(name: string): void {
    this.searchTerms.next(name);
  }

  /**
   * Function to unenroll a student, which calls the apposite service function and refresh the list
   *
   * @param(students) the list of students to be unenrolled
   */
  unenrollStudents(students: Student[]) {
    this.courseService.unenrollStudents(students)
        .pipe(
            first(),
            finalize(() => this.refreshEnrolled())
        )
        .subscribe();
  }

  /**
   * Function to enroll a student, which calls the apposite service function and refresh the list
   *
   * @param(students) the list of students to be enrolled
   */
  enrollStudents(students: Student[]) {
    this.courseService.enrollStudents(students)
        .pipe(
            first(),
            finalize(() => this.refreshEnrolled())
        )
        .subscribe();
  }

  /** Private function to refresh the list of enrolled students */
  private refreshEnrolled() {
    // Check if already received the current course
    if (!this.courseService.currentCourseSubject.value) {
      this.enrolledStudents = [];
      return;
    }
    this.courseService.getEnrolledStudents(this.courseService.currentCourseSubject.value).pipe(first()).subscribe(students => this.enrolledStudents = students);
  }
}
