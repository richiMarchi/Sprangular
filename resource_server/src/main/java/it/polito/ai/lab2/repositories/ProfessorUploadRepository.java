package it.polito.ai.lab2.repositories;

import it.polito.ai.lab2.entities.ProfessorUpload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfessorUploadRepository extends JpaRepository<ProfessorUpload, Long> {
}
