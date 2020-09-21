package it.polito.ai.lab2;

import it.polito.ai.lab2.entities.Role;
import it.polito.ai.lab2.repositories.RoleRepository;
import it.polito.ai.lab2.utility.Utility;
import lombok.extern.java.Log;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Log
@SpringBootApplication
public class SprangularBackend {

  @Autowired
  RoleRepository roleRepository;

  @Bean
  ModelMapper modelMapper() {
    return new ModelMapper();
  }

  @Bean
  CommandLineRunner getCommandLineRunner() {
    return args -> {
      // Create directory for file storage
      try {
        Files.createDirectory(Paths.get(Utility.IMAGES_ROOT_DIR));
        Files.createDirectory(Utility.PHOTOS_DIR);
        Files.createDirectory(Utility.ASSIGNMENTS_DIR);
        Files.createDirectory(Utility.UPLOADS_DIR);
        Files.createDirectory(Utility.VM_MODELS_DIR);
        Files.createDirectory(Utility.VMS_DIR);
        log.info("Uploads directory created");
      } catch (FileAlreadyExistsException e) {
        log.info("Uploads directory already exists");
      }

      // Insert roles in the DB
      if (!roleRepository.existsByName(Utility.ADMIN_ROLE)) {
        log.info("Creating Role " + Utility.ADMIN_ROLE);
        Role role = new Role();
        role.setName(Utility.ADMIN_ROLE);
        roleRepository.save(role);
      }
      if (!roleRepository.existsByName(Utility.PROFESSOR_ROLE)) {
        log.info("Creating Role " + Utility.PROFESSOR_ROLE);
        Role role = new Role();
        role.setName(Utility.PROFESSOR_ROLE);
        roleRepository.save(role);
      }
      if (!roleRepository.existsByName(Utility.STUDENT_ROLE)) {
        log.info("Creating Role " + Utility.STUDENT_ROLE);
        Role role = new Role();
        role.setName(Utility.STUDENT_ROLE);
        roleRepository.save(role);
      }
    };
  }

  public static void main(String[] args) {
    SpringApplication.run(SprangularBackend.class, args);
  }
}
