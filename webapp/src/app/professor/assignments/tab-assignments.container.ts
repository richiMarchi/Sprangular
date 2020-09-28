import {Component, OnDestroy, OnInit} from '@angular/core';
import {Assignment} from '../../models/assignment.model';
import {Course} from '../../models/course.model';
import {CourseService} from '../../services/course.service';
import {first, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

/**
 * AssignmentsContainer
 *
 * It displays the assignments view (WIP)
 */
@Component({
  selector: 'app-tab-professor-vms-cont',
  templateUrl: './tab-assignments.container.html'
})
export class TabProfessorAssignmentsContComponent implements OnInit, OnDestroy {

  private course: Course;                                      // The current selected course
  assignments: Assignment[] = [];                             // The current assignments
  private destroy$: Subject<boolean> = new Subject<boolean>(); // Private subject to perform the unsubscriptions when component is destroyed

  constructor(private courseService: CourseService) {
  }

  ngOnInit(): void {
    // Subscribe to the Broadcaster course selected, to update the current rendered course
    this.courseService.currentCourseSubject.asObservable().pipe(takeUntil(this.destroy$)).subscribe(course => {
      this.course = course;
      this.refreshAssignments();
    });
  }

  ngOnDestroy() {
    /** Destroying subscription */
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /** Private function to refresh the list of enrolled students */
  private refreshAssignments() {
    // Check if already received the current course
    if (!this.course) {
      this.assignments = [];
      return;
    }
    this.courseService.getCourseAssignments(this.course).pipe(first()).subscribe(assignments => this.assignments = assignments);
  }

}
