import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from './modals/login/login-dialog.component';
import { AuthService } from './services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from './models/user.model';
import { first } from 'rxjs/operators';
import { Course } from './models/course.model';
import { CourseService } from './services/course.service';
import { Observable, of } from 'rxjs';
import { Role } from './models/role.model';
import { StudentService } from './services/student.service';
import { ProfessorService } from './services/professor.service';
import { RegisterDialogComponent } from './modals/register/register-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  currentUser: User; // Variable to keep track of the current user
  courseList: Observable<Course[]>; // Variable to keep track (asynchronously) of the courses
  selectedCourseName: string; // Variable to store the current selected course name (notified by sub routes via Broadcaster service)

  // Unsubscribes are not performed here since alive till this root component is always alive and must be updated
  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    private route: ActivatedRoute,
    private courseService: CourseService,
    private router: Router,
    private studentService: StudentService,
    private professorService: ProfessorService
  ) {
    // Subscrive to current user and, if logged, refresh course list
    this.authService.getUserObservable().subscribe((user: User) => {
      this.currentUser = user;
      if (!user) {
        this.courseList = of([]);
      } else {
        if (user.roles.includes('ROLE_STUDENT')) {
          this.courseList = this.studentService
            .getStudentCourses(user.id)
            .pipe(first());
        } else if (user.roles.includes('ROLE_PROFESSOR')) {
          this.courseList = this.professorService
            .getProfessorCourses(user.id)
            .pipe(first());
        } /*else { //TODO: ADMIN features missing
          this.courseList = this.courseService.getCourses().pipe(first());
        }*/
      }
    });

    // Subscribe to Broadcaster selected course subject
    this.courseService.currentCourseSubject
      .asObservable()
      .subscribe(
        (course) => (this.selectedCourseName = course ? course.name : null)
      );

    // Subscribing to the route queryParam to check doLogin parameter
    this.route.queryParams.subscribe((queryParam) =>
      queryParam && queryParam.doLogin ? this.openLogin() : null
    );
  }

  /** Login Dialog show function
   *
   *  This function opens a dialog window where the user
   *  can perform login. When the dialog closes, a value is returned
   *  in order to check whether the operation has been successfully
   *  executed (in that case the user is redirected to the previously desired page or root)
   *  or not.
   */
  openLogin() {
    const dialogRef = this.dialog.open(LoginDialogComponent);
    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((result) => {
        if (result) {
          this.router.navigate([
            this.route.snapshot.queryParams.returnUrl || '/',
          ]);
        } else {
          this.router.navigate(['/']);
        }
      });
  }

  openRegister() {
    const dialogRef = this.dialog.open(RegisterDialogComponent);
    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((result) => {
        if (result) {
          this.router.navigate([
            this.route.snapshot.queryParams.returnUrl || '/',
          ]);
        } else {
          this.router.navigate(['/']);
        }
      });
  }

  /** Logout function
   *
   *  After calling all the proper functions to erase local data,
   *  the user is redirected to the webservice root
   */
  logout() {
    this.authService.logout();
    this.selectedCourseName = null;
    this.router.navigate(['/']);
  }
}
