package it.polito.ai.lab2.exceptions;

public class StudentUploadNotFoundException extends AssignmentAndUploadServiceException {
  public StudentUploadNotFoundException(String message) {
    super(message);
  }
}